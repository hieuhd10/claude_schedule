# LiftOne – Issue Detail Design

## 1. Mục tiêu màn hình

Màn hình **Issue Detail** dùng để quản lý toàn bộ vòng đời của một issue tại một nơi, từ lúc QA ghi nhận lỗi đến khi DEV debug, sửa lỗi, review, test và xác nhận hoàn thành.

Màn hình cần giúp người dùng trả lời nhanh các câu hỏi:

- Issue hiện đang ở bước nào?
- Ai đang phụ trách và thời hạn xử lý là khi nào?
- Nguyên nhân, cách sửa và bằng chứng kiểm thử là gì?
- Điều kiện để chuyển sang bước tiếp theo đã đủ chưa?
- Trong quá trình xử lý đã có những hoạt động và lần thực hiện nào?

> Thiết kế mẫu đang sử dụng issue `LO-2387 – Session expires unexpectedly during active use`.

## 2. Cấu trúc tổng thể

Màn hình được chia thành các khu vực theo thứ tự từ trên xuống:

| Khu vực | Nội dung chính |
|---|---|
| Thanh điều hướng | Điều hướng giữa Dashboard, Issues, Projects, Team và Reports |
| Thanh trên cùng | Breadcrumb, quay lại danh sách issue, sao chép link và menu mở rộng |
| Issue Header | Mã issue, tiêu đề, mô tả ngắn, trạng thái, mức ưu tiên, người phụ trách và hạn xử lý |
| Issue Information | Thông tin phân loại và bối cảnh của issue; luôn hiển thị ở mọi tab |
| Bộ chuyển tab | Overview, QA Report và History |
| Nội dung tab | Nội dung nghiệp vụ tương ứng với tab đang được chọn |

## 3. Khu vực thông tin chung

### 3.1. Issue Header

Hiển thị thông tin nhận diện và trạng thái tổng quan:

- Issue ID.
- Tiêu đề và mô tả ngắn.
- Priority và trạng thái hiện tại.
- Assignee.
- Due date.

### 3.2. Issue Information

Đây là vùng thông tin quan trọng dùng chung cho toàn bộ màn hình, gồm:

| Trường | Ý nghĩa |
|---|---|
| Severity | Mức độ ảnh hưởng của lỗi |
| Priority | Mức độ ưu tiên xử lý |
| Environment | Môi trường và nền tảng xảy ra lỗi |
| Affected build | Phiên bản bị ảnh hưởng |
| Reporter | Người báo cáo issue |
| Reproduction rate | Tỷ lệ tái hiện lỗi |
| Reported time | Thời điểm issue được ghi nhận |

**Quy tắc hiển thị:** Issue Information nằm **phía trên bộ chuyển tab**, không thuộc riêng QA Report. Khi chuyển giữa Overview, QA Report và History, người dùng vẫn luôn nhìn thấy khối thông tin này và dữ liệu không bị lặp lại trong từng tab.

## 4. Nội dung từng tab

### 4.1. Overview – Theo dõi flow xử lý

Overview là tab mặc định, tập trung vào tiến độ hoàn thành issue.

#### Completion Flow

Flow xử lý chính:

`Debug → Fix → Review → Test → Complete`

Mỗi bước hiển thị một trạng thái:

- **Completed:** Đã hoàn thành.
- **In progress:** Đang xử lý.
- **Waiting:** Chưa bắt đầu, đang chờ bước trước.
- **Pending:** Chưa đủ điều kiện hoàn thành issue.

Người dùng có thể chọn từng bước để xem nội dung tương ứng:

| Bước | Nội dung cần hiển thị |
|---|---|
| Debug | Kết quả phân tích, root cause, người thực hiện, thời điểm hoàn thành và checklist debug |
| Fix | Mô tả giải pháp, owner, branch, pull request và checklist DEV tự kiểm tra |
| Review | Reviewer, pull request, CI checks và checklist review |
| Test | Tester, môi trường, build và checklist kiểm thử |

#### Current Step Workspace

Khu vực làm việc của bước hiện tại gồm:

- Tên và mô tả công việc cần thực hiện.
- Owner hoặc người chịu trách nhiệm của bước.
- Các liên kết kỹ thuật như branch, pull request và build.
- Checklist điều kiện để chuyển bước.
- AI Summary hỗ trợ tổng hợp nhanh trạng thái.

Nút **Mark ready for review** chỉ được bật khi toàn bộ điều kiện bắt buộc của bước Fix đã hoàn thành.

#### Activity Panel

Hiển thị các hoạt động gần nhất như:

- Mở pull request.
- Hoàn thành self-test.
- Chuyển trạng thái từ Debug sang Fix.
- Bắt đầu debug và bổ sung bằng chứng.

Người dùng có thể mở toàn bộ lịch sử từ liên kết **View full history**.

#### Thông tin hỗ trợ

Phần cuối tab hiển thị:

- AI risk check và cảnh báo phạm vi ảnh hưởng.
- Pull request liên quan.
- Số lượng evidence files.
- Số lượng comments.

### 4.2. QA Report – Hồ sơ chi tiết của issue

QA Report tổng hợp tự động dữ liệu từ các hoạt động trong flow để tạo một hồ sơ kiểm chứng thống nhất.

#### 01. Bug Description

- Actual result.
- Expected result.
- Các bước tái hiện lỗi.
- Evidence như video, log và screenshot.

#### 02. Debug & Root Cause

- Root cause đã xác nhận.
- Component bị ảnh hưởng.
- Phạm vi ảnh hưởng.
- Điều kiện kích hoạt lỗi.

#### 03. Fix Information

- Mô tả giải pháp đã triển khai.
- Branch, pull request và commit gần nhất.
- Trạng thái thực hiện.
- Remaining risk cần tiếp tục kiểm tra.

#### 04. Test Verification

- Tổng số test case, số Passed, Pending và Failed.
- Danh sách test item, phạm vi kiểm thử, kết quả và evidence.
- Trạng thái mức độ hoàn thiện của phần kiểm thử.

#### Report Readiness

Panel bên phải thể hiện mức độ sẵn sàng của báo cáo theo các nhóm:

- Issue information.
- Root cause.
- Fix record.
- Test verification.

Kết luận cuối cùng chỉ được xác nhận khi các critical test case và evidence bắt buộc đã hoàn thành. AI Report Check hỗ trợ phát hiện phần thông tin hoặc bằng chứng còn thiếu.

Các thao tác chính:

- Copy link báo cáo.
- Export report.
- Mở evidence.
- Chạy lại AI report check.
- Confirm issue resolved khi đủ điều kiện.
- Reopen issue sau khi issue đã được đóng.

### 4.3. History – Lịch sử và các lần xử lý

History lưu toàn bộ thay đổi workflow, hoạt động kỹ thuật, bằng chứng và quyết định liên quan đến issue.

#### Activity Timeline

Hoạt động được nhóm theo từng lần thực hiện:

- Issue reported.
- Debug attempt.
- Fix attempt.
- Các Review/Test attempt phát sinh sau đó.

Mỗi activity gồm thời gian, người thực hiện, hành động, mô tả chi tiết, loại hoạt động và record liên quan.

#### Bộ lọc

Người dùng có thể lọc theo:

- All activity.
- Workflow.
- Code & PR.
- Test.
- Comments.

#### Summary Panel

Panel tổng hợp bên phải gồm:

- Total elapsed và Active time.
- Thời gian xử lý theo từng bước Debug, Fix, Review và Test.
- Số attempt của từng bước.
- Trạng thái rework.
- Các record liên quan: pull request, commit, evidence file và comment.

## 5. Logic chuyển bước

| Từ bước | Điều kiện chính để chuyển bước |
|---|---|
| Debug → Fix | Tái hiện được lỗi, xác định root cause và thống nhất hướng xử lý |
| Fix → Review | Hoàn thành code, unit test, self-test và pull request sẵn sàng |
| Review → Test | CI checks đạt, comment bắt buộc đã xử lý và reviewer phê duyệt |
| Test → Complete | Critical test và regression đạt, evidence đầy đủ, không còn lỗi blocking |

Nếu xuất hiện blocker, người dùng có thể chọn **Report blocker**, nhập nội dung và đơn vị cần hỗ trợ. Issue vẫn giữ nguyên bước hiện tại nhưng trạng thái tổng thể chuyển sang Blocked.

Nếu Review hoặc Test không đạt, issue có thể quay lại bước trước và hệ thống tạo attempt mới để bảo toàn đầy đủ lịch sử xử lý.

## 6. Quy tắc tương tác chính

- Chuyển tab không làm mất trạng thái hoặc dữ liệu đang theo dõi.
- Issue Information luôn hiển thị trước bộ tab.
- Checklist quyết định việc bật hoặc tắt hành động chuyển bước.
- Mọi thay đổi trạng thái, evidence, pull request, commit và comment đều được ghi vào History.
- Thời gian **Active time** chỉ tính thời gian issue đang được xử lý, tách biệt với tổng thời gian chờ.
- QA Report ưu tiên dữ liệu được tạo từ workflow để hạn chế nhập lại thủ công.
- Các thao tác nhanh hiển thị phản hồi bằng toast để người dùng biết hành động đã được ghi nhận.
- Các hành động đóng issue chỉ khả dụng khi toàn bộ điều kiện bắt buộc đã hoàn thành.

## 7. Giá trị của thiết kế

- Cho phép DEV, QA, Reviewer và Leader theo dõi cùng một flow thống nhất.
- Kết nối tiến độ xử lý với bằng chứng thực tế thay vì chỉ dựa vào trạng thái thủ công.
- Giảm việc tìm kiếm thông tin rời rạc giữa issue, pull request, test result và comment.
- Làm rõ trách nhiệm, điều kiện chuyển bước và nguyên nhân issue bị chậm.
- Giữ được toàn bộ lịch sử attempt và rework để phục vụ đánh giá chất lượng sau này.

---

Thiết kế tham chiếu: [LiftOne Issue Detail](https://liftone-issue-detail.huynhduchieu1012.chatgpt.site/)
